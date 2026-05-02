using HamroKhata.API.Data;
using HamroKhata.API.DTOs.Public;
using HamroKhata.API.DTOs.Transactions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HamroKhata.API.Controllers;

[ApiController]
[Route("public")]
public class PublicController : ControllerBase
{
    private readonly HamroKhataDbContext _db;

    public PublicController(HamroKhataDbContext db) => _db = db;

    // GET /public/{publicId}  — No authentication required
    [HttpGet("{publicId}")]
    public async Task<IActionResult> GetLedger(string publicId)
    {
        var customer = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Transactions)
            .FirstOrDefaultAsync(c => c.PublicId == publicId);

        if (customer is null) return NotFound(new { message = "Ledger not found." });

        var balance = customer.Transactions
            .Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount);

        var response = new PublicLedgerResponse
        {
            CustomerName = customer.Name,
            CustomerPhone = customer.Phone,
            ShopName = customer.User.Name,
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
        };

        return Ok(response);
    }
}
