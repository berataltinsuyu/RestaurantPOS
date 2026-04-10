using Backend.Entities;
using Backend.Enums;

namespace Backend.Helpers;

public sealed class PosGatewayResult
{
    public bool IsSuccess { get; init; }
    public string ReferenceNo { get; init; } = string.Empty;
    public string? ApprovalCode { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
    public PosTerminalStatus TerminalStatus { get; init; }
}

public interface IPosGateway
{
    Task<PosGatewayResult> TestConnectionAsync(PosTerminal terminal, CancellationToken cancellationToken = default);
    Task<PosGatewayResult> ProcessCardPaymentAsync(PosTerminal terminal, decimal amount, string? maskedPan, CancellationToken cancellationToken = default);
    Task<PosGatewayResult> ProcessRefundAsync(PosTerminal terminal, decimal amount, string referenceNo, CancellationToken cancellationToken = default);
}

public class MockPosGateway(IReferenceGenerator referenceGenerator) : IPosGateway
{
    public Task<PosGatewayResult> TestConnectionAsync(PosTerminal terminal, CancellationToken cancellationToken = default)
    {
        var isSuccess = terminal.Status != PosTerminalStatus.Cevrimdisi;
        return Task.FromResult(new PosGatewayResult
        {
            IsSuccess = isSuccess,
            ReferenceNo = referenceGenerator.CreatePaymentReference(),
            ApprovalCode = isSuccess ? referenceGenerator.CreateApprovalCode() : null,
            ErrorCode = isSuccess ? null : "POS-OFFLINE",
            ErrorMessage = isSuccess ? "Terminal is reachable." : "Terminal is offline.",
            TerminalStatus = isSuccess ? PosTerminalStatus.Bagli : PosTerminalStatus.Cevrimdisi
        });
    }

    public Task<PosGatewayResult> ProcessCardPaymentAsync(PosTerminal terminal, decimal amount, string? maskedPan, CancellationToken cancellationToken = default)
    {
        var isSuccess = terminal.Status != PosTerminalStatus.Cevrimdisi && Random.Shared.NextDouble() >= 0.2;
        return Task.FromResult(new PosGatewayResult
        {
            IsSuccess = isSuccess,
            ReferenceNo = referenceGenerator.CreatePaymentReference(),
            ApprovalCode = isSuccess ? referenceGenerator.CreateApprovalCode() : null,
            ErrorCode = isSuccess ? null : "ERR-POS-4021",
            ErrorMessage = isSuccess ? null : "POS terminali yanıt vermiyor veya kart reddedildi.",
            TerminalStatus = isSuccess ? PosTerminalStatus.Bagli : PosTerminalStatus.Mesgul
        });
    }

    public Task<PosGatewayResult> ProcessRefundAsync(PosTerminal terminal, decimal amount, string referenceNo, CancellationToken cancellationToken = default)
    {
        var isSuccess = terminal.Status != PosTerminalStatus.Cevrimdisi && Random.Shared.NextDouble() >= 0.15;
        return Task.FromResult(new PosGatewayResult
        {
            IsSuccess = isSuccess,
            ReferenceNo = referenceGenerator.CreatePaymentReference(),
            ApprovalCode = isSuccess ? referenceGenerator.CreateApprovalCode() : null,
            ErrorCode = isSuccess ? null : "ERR-POS-4098",
            ErrorMessage = isSuccess ? null : "İade işlemi banka tarafından reddedildi.",
            TerminalStatus = isSuccess ? PosTerminalStatus.Bagli : PosTerminalStatus.Mesgul
        });
    }
}
