using System.Text.Json.Serialization;

public class InvoiceGenRequest
{
    [JsonPropertyName("From")]
    public string From { get; set; }

    [JsonPropertyName("To")]
    public string To { get; set; }

    [JsonPropertyName("Items")]
    public List<InvoiceGenItem> Items { get; set; }

    [JsonPropertyName("Number")]
    public int Number { get; set; }

    [JsonPropertyName("Amount_Paid")]
    public decimal Amount_Paid { get; set; } = 0;
}

public class InvoiceGenItem
{
    [JsonPropertyName("Name")]
    public string Name { get; set; }

    [JsonPropertyName("Quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("Unit_Cost")]
    public decimal Unit_Cost { get; set; }
}
