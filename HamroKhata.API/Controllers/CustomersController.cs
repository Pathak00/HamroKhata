using System.Security.Claims;
using HamroKhata.API.Data;
using HamroKhata.API.Data.Entities;
using HamroKhata.API.DTOs.Customers;
using HamroKhata.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HamroKhata.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly HamroKhataDbContext _db;

    public CustomersController(HamroKhataDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/customers
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _db.Customers
            .Where(c => c.UserId == CurrentUserId)
            .Include(c => c.Transactions)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerResponse
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                PublicId = c.PublicId,
                CreatedAt = c.CreatedAt,
                Balance = c.Transactions
                    .Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount)
            })
            .ToListAsync();

        return Ok(customers);
    }

    // POST /api/customers
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CustomerRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Ensure unique PublicId
        string publicId;
        do { publicId = PublicIdHelper.Generate(); }
        while (await _db.Customers.AnyAsync(c => c.PublicId == publicId));

        var customer = new Customer
        {
            UserId = CurrentUserId,
            Name = req.Name.Trim(),
            Phone = req.Phone.Trim(),
            PublicId = publicId
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new CustomerResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            PublicId = customer.PublicId,
            CreatedAt = customer.CreatedAt,
            Balance = 0
        });
    }

    // PUT /api/customers/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CustomerRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);

        if (customer is null) return NotFound();

        customer.Name = req.Name.Trim();
        customer.Phone = req.Phone.Trim();
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/customers/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);

        if (customer is null) return NotFound();

        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
