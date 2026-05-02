using System.Security.Claims;
using HamroKhata.API.Data;
using HamroKhata.API.DTOs.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HamroKhata.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly HamroKhataDbContext _db;

    public DashboardController(HamroKhataDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/dashboard
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var customers = await _db.Customers
            .Where(c => c.UserId == CurrentUserId)
            .Include(c => c.Transactions)
            .ToListAsync();

        var totalReceivable = customers
            .SelectMany(c => c.Transactions)
            .Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount);

        return Ok(new DashboardResponse
        {
            TotalCustomers = customers.Count,
            TotalReceivable = totalReceivable
        });
    }
}
