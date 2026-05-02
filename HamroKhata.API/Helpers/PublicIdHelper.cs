using System.Security.Cryptography;

namespace HamroKhata.API.Helpers;

public static class PublicIdHelper
{
    private const string Alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int Length = 8;

    public static string Generate()
    {
        var chars = new char[Length];
        var bytes = RandomNumberGenerator.GetBytes(Length);
        for (int i = 0; i < Length; i++)
            chars[i] = Alphabet[bytes[i] % Alphabet.Length];
        return new string(chars);
    }
}
