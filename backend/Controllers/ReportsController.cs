using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/reports")]
public class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("dashboard-summary")]
    public async Task<ActionResult<DashboardSummaryDto>> DashboardSummary([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await reportService.GetDashboardSummaryAsync(branchId, cancellationToken));

    [HttpGet("daily-revenue")]
    public async Task<ActionResult<List<DailyRevenueDto>>> DailyRevenue([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await reportService.GetDailyRevenueAsync(branchId, cancellationToken));

    [HttpGet("payment-distribution")]
    public async Task<ActionResult<List<PaymentDistributionDto>>> PaymentDistribution([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await reportService.GetPaymentDistributionAsync(branchId, cancellationToken));

    [HttpGet("table-performance")]
    public async Task<ActionResult<List<TablePerformanceDto>>> TablePerformance([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await reportService.GetTablePerformanceAsync(branchId, cancellationToken));

    [HttpGet("terminal-performance")]
    public async Task<ActionResult<List<TerminalPerformanceDto>>> TerminalPerformance([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await reportService.GetTerminalPerformanceAsync(branchId, cancellationToken));

    [HttpGet("failed-transactions")]
    public async Task<ActionResult<List<FailedTransactionDto>>> FailedTransactions([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await reportService.GetFailedTransactionsAsync(branchId, cancellationToken));
}
