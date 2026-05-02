using HamroKhata.API.Data;
using HamroKhata.API.Data.Entities;
using HamroKhata.API.DTOs.Auth;
using HamroKhata.API.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HamroKhata.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly HamroKhataDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(HamroKhataDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (await _db.Users.AnyAsync(u => u.Phone == req.Phone))
            return Conflict(new { message = "Phone number already registered." });

        var user = new User
        {
            Name = req.Name.Trim(),
            Phone = req.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = JwtHelper.GenerateToken(user, _config);
        return Ok(new AuthResponse { Token = token, Name = user.Name, Phone = user.Phone, IsAdmin = user.IsAdmin });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Phone == req.Phone);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid phone or password." });

        // Record the login event
        var loginLog = new UserLoginLog
        {
            UserId = user.Id,
            LoggedInAt = DateTime.UtcNow,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = HttpContext.Request.Headers.UserAgent.ToString().Length > 500
                ? HttpContext.Request.Headers.UserAgent.ToString()[..500]
                : HttpContext.Request.Headers.UserAgent.ToString()
        };
        _db.UserLoginLogs.Add(loginLog);
        await _db.SaveChangesAsync();

        var token = JwtHelper.GenerateToken(user, _config);
        return Ok(new AuthResponse { Token = token, Name = user.Name, Phone = user.Phone, IsAdmin = user.IsAdmin });
    }
}
