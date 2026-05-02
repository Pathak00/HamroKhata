using System.ComponentModel.DataAnnotations;

namespace HamroKhata.API.DTOs.Transactions;

public class TransactionRequest
{
    [Required, Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public string Type { get; set; } = string.Empty; // "Credit" | "Payment"

    [MaxLength(500)]
    public string? Note { get; set; }
}
