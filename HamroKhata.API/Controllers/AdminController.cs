using HamroKhata.API.Data;
using HamroKhata.API.DTOs.Admin;
using HamroKhata.API.DTOs.Customers;
using HamroKhata.API.DTOs.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HamroKhata.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly HamroKhataDbContext _db;

    public AdminController(HamroKhataDbContext db) => _db = db;

    // GET /api/admin/users
    // Returns all shop owners (non-admin users) with their customer count, total receivable, and login stats
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.Users
            .Where(u => !u.IsAdmin)
            .Include(u => u.Customers)
                .ThenInclude(c => c.Transactions)
            .Include(u => u.LoginLogs)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var result = users.Select(u => new AdminUserResponse
        {
            Id = u.Id,
            Name = u.Name,
            Phone = u.Phone,
            CreatedAt = u.CreatedAt,
            TotalCustomers = u.Customers.Count,
            TotalReceivable = u.Customers
                .SelectMany(c => c.Transactions)
                .Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount),
            TotalLogins = u.LoginLogs.Count,
            LastLoginAt = u.LoginLogs
                .OrderByDescending(l => l.LoggedInAt)
                .Select(l => (DateTime?)l.LoggedInAt)
                .FirstOrDefault()
        });

        return Ok(result);
    }

    // GET /api/admin/users/{userId}/logins
    // Returns the full login history for a specific user
    [HttpGet("users/{userId:int}/logins")]
    public async Task<IActionResult> GetLoginHistory(int userId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId && !u.IsAdmin);
        if (!userExists) return NotFound(new { message = "Shop user not found." });

        var logs = await _db.UserLoginLogs
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.LoggedInAt)
            .Select(l => new LoginLogResponse
            {
                Id = l.Id,
                LoggedInAt = l.LoggedInAt,
                IpAddress = l.IpAddress,
                UserAgent = l.UserAgent
            })
            .ToListAsync();

        return Ok(logs);
    }

    // GET /api/admin/users/{userId}/customers
    // Returns all customers of a specific shop user
    [HttpGet("users/{userId:int}/customers")]
    public async Task<IActionResult> GetCustomersByUser(int userId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId && !u.IsAdmin);
        if (!userExists) return NotFound(new { message = "Shop user not found." });

        var customers = await _db.Customers
            .Where(c => c.UserId == userId)
            .Include(c => c.Transactions)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerResponse
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                PublicId = c.PublicId,
                CreatedAt = c.CreatedAt,
                Balance = c.Transactions.Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount)
            })
            .ToListAsync();

        return Ok(customers);
    }

    // GET /api/admin/users/{userId}/customers/{customerId}/transactions
    // Returns all transactions for a specific customer (admin view)
    [HttpGet("users/{userId:int}/customers/{customerId:int}/transactions")]
    public async Task<IActionResult> GetTransactionsByCustomer(int userId, int customerId)
    {
        var customer = await _db.Customers
            .Include(c => c.Transactions)
            .FirstOrDefaultAsync(c => c.Id == customerId && c.UserId == userId);

        if (customer is null) return NotFound(new { message = "Customer not found." });

        var balance = customer.Transactions
            .Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount);

        return Ok(new AdminCustomerResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            PublicId = customer.PublicId,
            CreatedAt = customer.CreatedAt,
            Balance = balance,
            Transactions = customer.Transactions
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TransactionResponse
                {
                    Id = t.Id,
                    Amount = t.Amount,
                    Type = t.Type,
                    Note = t.Note,
                    CreatedAt = t.CreatedAt
                })
                .ToList()
        });
    }
}
