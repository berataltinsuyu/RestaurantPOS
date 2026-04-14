using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Helpers;
using Backend.Middleware;
using Backend.Repositories;
using Backend.Seed;
using Backend.Services;
using Backend.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

builder.Services.AddHttpContextAccessor();
var databaseConnectionString = PostgreSqlConnectionStringResolver.Resolve(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(databaseConnectionString));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IBillCalculator, BillCalculator>();
builder.Services.AddScoped<IReferenceGenerator, ReferenceGenerator>();
builder.Services.AddScoped<IPosGateway, MockPosGateway>();
builder.Services.AddScoped<ISeedService, SeedService>();
builder.Services.AddScoped<ITableLifecycleService, TableLifecycleService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IBillService, BillService>();
builder.Services.AddScoped<ITerminalService, TerminalService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IPermissionAuthorizationService, PermissionAuthorizationService>();
builder.Services.AddHostedService<TableLifecycleBackgroundService>();

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services
    .AddFluentValidationAutoValidation()
    .AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are missing.");
var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        NameClaimType = ClaimTypes.Name,
        RoleClaimType = ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var authorizationHeader = context.Request.Headers.Authorization.ToString();
            if (string.IsNullOrWhiteSpace(authorizationHeader))
            {
                return Task.CompletedTask;
            }

            const string bearerPrefix = "Bearer ";
            if (!authorizationHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return Task.CompletedTask;
            }

            var token = authorizationHeader[bearerPrefix.Length..].Trim();
            if (token.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            {
                token = token[bearerPrefix.Length..].Trim();
            }

            context.Token = token;
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
        .WithOrigins(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
            "https://restaurant-pos-pink.vercel.app")
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "VakifBank Restaurant POS API",
        Version = "v1",
        Description = "Restaurant billing and POS payment backend aligned to the VakifBank-branded frontend."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT token or 'Bearer {token}'. Both formats are accepted."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (!IsEntityFrameworkDesignTime())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();

    var seedService = scope.ServiceProvider.GetRequiredService<ISeedService>();
    await seedService.SeedAsync();
}

app.Run();

static bool IsEntityFrameworkDesignTime()
{
    var commandLineArgs = Environment.GetCommandLineArgs();
    if (commandLineArgs.Any(arg =>
            arg.Contains("dotnet-ef", StringComparison.OrdinalIgnoreCase) ||
            arg.Contains("ef.dll", StringComparison.OrdinalIgnoreCase)))
    {
        return true;
    }

    return AppDomain.CurrentDomain.GetAssemblies().Any(assembly =>
        string.Equals(
            assembly.GetName().Name,
            "Microsoft.EntityFrameworkCore.Design",
            StringComparison.OrdinalIgnoreCase));
}
