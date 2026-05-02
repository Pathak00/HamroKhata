using System.ComponentModel.DataAnnotations;

namespace HamroKhata.API.DTOs.Customers;

public class CustomerRequest
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;
}
