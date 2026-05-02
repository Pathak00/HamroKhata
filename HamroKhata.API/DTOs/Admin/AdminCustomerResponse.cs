using HamroKhata.API.DTOs.Transactions;

namespace HamroKhata.API.DTOs.Admin;

public class AdminCustomerResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TransactionResponse> Transactions { get; set; } = new();
}
