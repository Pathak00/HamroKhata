using System.ComponentModel.DataAnnotations;

namespace HamroKhata.API.DTOs.Auth;

public class LoginRequest
{
    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
