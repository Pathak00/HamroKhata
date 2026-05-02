namespace HamroKhata.API.DTOs.Admin;

public class AdminUserResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int TotalCustomers { get; set; }
    public decimal TotalReceivable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int TotalLogins { get; set; }
}
