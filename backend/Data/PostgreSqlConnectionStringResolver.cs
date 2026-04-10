using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Backend.Data;

public static class PostgreSqlConnectionStringResolver
{
    public static string Resolve(IConfiguration configuration)
    {
        var configuredConnectionString =
            configuration.GetConnectionString("DefaultConnection") ??
            configuration["DATABASE_URL"] ??
            throw new InvalidOperationException("DefaultConnection is missing.");

        return Normalize(configuredConnectionString);
    }

    public static string Normalize(string configuredConnectionString)
    {
        if (string.IsNullOrWhiteSpace(configuredConnectionString))
        {
            throw new InvalidOperationException("DefaultConnection is empty.");
        }

        if (configuredConnectionString.StartsWith("Host=", StringComparison.OrdinalIgnoreCase))
        {
            return AppendSupabaseSslSettings(configuredConnectionString);
        }

        if (configuredConnectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            configuredConnectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return AppendSupabaseSslSettings(FromUrl(configuredConnectionString));
        }

        return AppendSupabaseSslSettings(configuredConnectionString);
    }

    private static string FromUrl(string connectionUrl)
    {
        var schemeSeparatorIndex = connectionUrl.IndexOf("://", StringComparison.Ordinal);
        if (schemeSeparatorIndex < 0)
        {
            throw new InvalidOperationException("PostgreSQL connection URL is invalid.");
        }

        var remainder = connectionUrl[(schemeSeparatorIndex + 3)..];
        var atIndex = remainder.LastIndexOf('@');
        if (atIndex < 0)
        {
            throw new InvalidOperationException("PostgreSQL connection URL is invalid.");
        }

        var userInfo = remainder[..atIndex];
        var hostAndDatabase = remainder[(atIndex + 1)..];

        var credentials = userInfo.Split(':', 2);
        if (credentials.Length != 2)
        {
            throw new InvalidOperationException("PostgreSQL connection URL credentials are invalid.");
        }

        var username = Uri.UnescapeDataString(credentials[0]);
        var password = Uri.UnescapeDataString(credentials[1]);
        if (password.StartsWith('[') && password.EndsWith(']'))
        {
            password = password[1..^1];
        }

        var slashIndex = hostAndDatabase.IndexOf('/');
        if (slashIndex < 0)
        {
            throw new InvalidOperationException("PostgreSQL connection URL database segment is invalid.");
        }

        var hostPort = hostAndDatabase[..slashIndex];
        var database = hostAndDatabase[(slashIndex + 1)..];

        var hostPortParts = hostPort.Split(':', 2);
        var host = hostPortParts[0];
        var port = hostPortParts.Length > 1 && int.TryParse(hostPortParts[1], out var parsedPort)
            ? parsedPort
            : 5432;

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = host,
            Port = port,
            Database = database,
            Username = username,
            Password = password
        };

        return builder.ConnectionString;
    }

    private static string AppendSupabaseSslSettings(string connectionString)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString)
        {
            SslMode = SslMode.Require
        };

        if (!builder.ContainsKey("Include Error Detail"))
        {
            builder.IncludeErrorDetail = true;
        }

        return builder.ConnectionString;
    }
}
