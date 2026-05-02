using System.Security.Claims;
using HamroKhata.API.Data;
using HamroKhata.API.Data.Entities;
using HamroKhata.API.DTOs.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HamroKhata.API.Controllers;

[ApiController]
[Route("api/customers/{customerId:int}/transactions")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly HamroKhataDbContext _db;

    public TransactionsController(HamroKhataDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/customers/{customerId}/transactions
    [HttpGet]
    public async Task<IActionResult> GetAll(int customerId)
    {
        // Validate customer belongs to the logged-in user
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId && c.UserId == CurrentUserId);
        if (customer is null) return NotFound();

        var transactions = await _db.Transactions
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TransactionResponse
            {
                Id = t.Id,
                Amount = t.Amount,
                Type = t.Type,
                Note = t.Note,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(transactions);
    }

    // POST /api/customers/{customerId}/transactions
    [HttpPost]
    public async Task<IActionResult> Create(int customerId, [FromBody] TransactionRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (req.Type != "Credit" && req.Type != "Payment")
            return BadRequest(new { message = "Type must be 'Credit' or 'Payment'." });

        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId && c.UserId == CurrentUserId);
        if (customer is null) return NotFound();

        var transaction = new Transaction
        {
            CustomerId = customerId,
            Amount = req.Amount,
            Type = req.Type,
            Note = req.Note?.Trim()
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { customerId }, new TransactionResponse
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Type = transaction.Type,
            Note = transaction.Note,
            CreatedAt = transaction.CreatedAt
        });
    }
}
