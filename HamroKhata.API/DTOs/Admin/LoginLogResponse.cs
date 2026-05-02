namespace HamroKhata.API.DTOs.Admin;

public class LoginLogResponse
{
    public int Id { get; set; }
    public DateTime LoggedInAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
