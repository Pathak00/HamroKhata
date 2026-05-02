namespace HamroKhata.API.Data.Entities;

public class UserLoginLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime LoggedInAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    public virtual User User { get; set; } = null!;
}
