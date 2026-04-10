using Backend.DTOs;
using Backend.Entities;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IAuditLogService
{
    Task<List<AuditLogDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<AuditLogDto>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken = default);
    Task CreateAsync(int? userId, string action, string entityName, string entityId, string description, string? ipAddress, CancellationToken cancellationToken = default);
}

public class AuditLogService(IRepository<AuditLog> auditLogRepository, IUnitOfWork unitOfWork) : IAuditLogService
{
    public async Task<List<AuditLogDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var logs = await auditLogRepository.Query()
            .AsNoTracking()
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return logs.Select(Map).ToList();
    }

    public async Task<List<AuditLogDto>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken = default)
    {
        var logs = await auditLogRepository.Query()
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.EntityName == entityName && x.EntityId == entityId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return logs.Select(Map).ToList();
    }

    public async Task CreateAsync(int? userId, string action, string entityName, string entityId, string description, string? ipAddress, CancellationToken cancellationToken = default)
    {
        await auditLogRepository.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Description = description,
            IpAddress = ipAddress
        }, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static AuditLogDto Map(AuditLog entity) => new()
    {
        Id = entity.Id,
        UserId = entity.UserId,
        UserName = entity.User?.FullName,
        Action = entity.Action,
        EntityName = entity.EntityName,
        EntityId = entity.EntityId,
        Description = entity.Description,
        CreatedAt = entity.CreatedAt,
        IpAddress = entity.IpAddress
    };
}
