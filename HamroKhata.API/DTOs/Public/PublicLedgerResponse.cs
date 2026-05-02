using HamroKhata.API.DTOs.Transactions;

namespace HamroKhata.API.DTOs.Public;

public class PublicLedgerResponse
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public List<TransactionResponse> Transactions { get; set; } = new();
}
