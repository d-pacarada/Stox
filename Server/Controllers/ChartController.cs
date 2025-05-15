using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChartController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetUserIdFromClaims()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            return string.IsNullOrEmpty(userIdClaim) ? null : int.Parse(userIdClaim);
        }
        
        [HttpGet("sales/yearscomparison")]
        public async Task<IActionResult> GetYearsComparison()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            // Find the earliest and latest years in the database for this user
            var yearRange = await _context.Invoice
                .Where(i => i.User_ID == userId)
                .GroupBy(i => i.Invoice_Date.Year)
                .Select(g => g.Key)
                .ToListAsync();

            var currentYear = DateTime.UtcNow.Year;
            
            // If no data exists, return empty result
            if (!yearRange.Any())
            {
                return Ok(new List<YearlyComparisonData>());
            }

            // Get data for each year and all years combined
            var yearlySales = new List<YearlyComparisonData>();
            var allYearsMonthlyData = new Dictionary<int, decimal>();
            
            foreach (var year in yearRange)
            {
                // Get total sales for each month of this year
                var monthlySales = await _context.Invoice
                    .Where(i => i.User_ID == userId && 
                                i.Invoice_Date.Year == year)
                    .GroupBy(i => i.Invoice_Date.Month)
                    .Select(g => new
                    {
                        Month = g.Key,
                        Total = g.Sum(i => i.Total_Amount)
                    })
                    .ToDictionaryAsync(x => x.Month, x => x.Total);
                
                // Calculate total for the year
                var yearlyTotal = monthlySales.Values.Sum();
                
                // Create data point for this year
                yearlySales.Add(new YearlyComparisonData
                {
                    Year = year,
                    Total = yearlyTotal,
                    MonthlyData = Enumerable.Range(1, 12)
                        .Select(month => new MonthlyData 
                        { 
                            Month = month,
                            MonthName = new DateTime(year, month, 1).ToString("MMM"),
                            Total = monthlySales.ContainsKey(month) ? monthlySales[month] : 0
                        })
                        .ToList()
                });
                
                // Add to all years combined data
                foreach (var monthData in monthlySales)
                {
                    if (allYearsMonthlyData.ContainsKey(monthData.Key))
                    {
                        allYearsMonthlyData[monthData.Key] += monthData.Value;
                    }
                    else
                    {
                        allYearsMonthlyData[monthData.Key] = monthData.Value;
                    }
                }
            }
            
            // Add "All Years" combined data
            if (yearRange.Count > 1)
            {
                yearlySales.Add(new YearlyComparisonData
                {
                    Year = 0, // Use 0 to represent "All Years"
                    Total = allYearsMonthlyData.Values.Sum(),
                    MonthlyData = Enumerable.Range(1, 12)
                        .Select(month => new MonthlyData 
                        { 
                            Month = month,
                            MonthName = new DateTime(DateTime.UtcNow.Year, month, 1).ToString("MMM"),
                            Total = allYearsMonthlyData.ContainsKey(month) ? allYearsMonthlyData[month] : 0
                        })
                        .ToList()
                });
            }

            return Ok(yearlySales.OrderByDescending(y => y.Year).ToList());
        }

        [HttpGet("sales/daily")]
        public async Task<IActionResult> GetDailySales()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            // Get sales for each hour of today
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);
            
            // Create hours list for today (0-23)
            var hourLabels = Enumerable.Range(0, 24)
                .Select(h => new
                {
                    Hour = h,
                    Label = $"{h:00}:00"
                })
                .ToList();

            // Query sales grouped by hour
            var salesByHour = await _context.Invoice
                .Where(i => i.User_ID == userId && 
                            i.Invoice_Date >= today && 
                            i.Invoice_Date < tomorrow)
                .GroupBy(i => i.Invoice_Date.Hour)
                .Select(g => new
                {
                    Hour = g.Key,
                    Total = g.Sum(i => i.Total_Amount)
                })
                .ToDictionaryAsync(x => x.Hour, x => x.Total);

            // Combine hour labels with sales data
            var data = hourLabels.Select(h => new ChartData
            {
                Label = h.Label,
                Total = salesByHour.ContainsKey(h.Hour) ? salesByHour[h.Hour] : 0
            }).ToList();

            return Ok(data);
        }

        [HttpGet("sales/weekly")]
        public async Task<IActionResult> GetWeeklySales()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            // Get last 7 days including today
            var endDate = DateTime.UtcNow.Date.AddDays(1); // Tomorrow to include all of today
            var startDate = endDate.AddDays(-7); // 7 days ago
            
            // Create day labels for the week
            var dayLabels = Enumerable.Range(0, 7)
                .Select(offset => startDate.AddDays(offset))
                .Select(date => new
                {
                    Date = date,
                    Label = date.ToString("ddd, MMM d") // Mon, Jan 1 format
                })
                .ToList();

            // Query sales grouped by date
            var salesByDate = await _context.Invoice
                .Where(i => i.User_ID == userId && 
                            i.Invoice_Date >= startDate && 
                            i.Invoice_Date < endDate)
                .GroupBy(i => i.Invoice_Date.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Total = g.Sum(i => i.Total_Amount)
                })
                .ToDictionaryAsync(x => x.Date, x => x.Total);

            // Combine day labels with sales data
            var data = dayLabels.Select(d => new ChartData
            {
                Label = d.Label,
                Total = salesByDate.ContainsKey(d.Date) ? salesByDate[d.Date] : 0,
                Date = d.Date.ToString("yyyy-MM-dd") // Add full date for sorting
            }).ToList();

            return Ok(data);
        }

        [HttpGet("sales/monthly")]
        public async Task<IActionResult> GetMonthlySales()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            // Get last 30 days
            var endDate = DateTime.UtcNow.Date.AddDays(1); // Tomorrow to include all of today
            var startDate = endDate.AddDays(-30); // 30 days ago
            
            // Query sales grouped by date
            var data = await _context.Invoice
                .Where(i => i.User_ID == userId && 
                            i.Invoice_Date >= startDate && 
                            i.Invoice_Date < endDate)
                .GroupBy(i => i.Invoice_Date.Date)
                .Select(g => new ChartData
                {
                    Label = g.Key.ToString("MMM d"), // Jan 1 format
                    Total = g.Sum(i => i.Total_Amount),
                    Date = g.Key.ToString("yyyy-MM-dd") // Add full date for sorting
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            // Fill in missing dates with zero sales
            var allDates = Enumerable.Range(0, 30)
                .Select(offset => startDate.AddDays(offset))
                .ToList();
                
            var existingDates = new HashSet<DateTime>();

            foreach (var d in data)
            {
                if (!string.IsNullOrWhiteSpace(d.Date) && DateTime.TryParseExact(d.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
                {
                    existingDates.Add(parsedDate);
                }
            }

                
            foreach (var date in allDates)
            {
                if (!existingDates.Contains(date))
                {
                    data.Add(new ChartData
                    {
                        Label = date.ToString("MMM d"),
                        Total = 0,
                        Date = date.ToString("yyyy-MM-dd")
                    });
                }
            }

            return Ok(data.OrderBy(d => d.Date).ToList());
        }

        [HttpGet("sales/yearly")]
        public async Task<IActionResult> GetYearlySales()
        {
            var userId = GetUserIdFromClaims();
            if (userId == null) return Unauthorized();

            // Get last 12 months
            var now = DateTime.UtcNow;
            var endDate = new DateTime(now.Year, now.Month, 1).AddMonths(1); // First day of next month
            var startDate = endDate.AddMonths(-12); // 12 months ago
            
            // Create month labels for the year
            var monthLabels = Enumerable.Range(0, 12)
                .Select(offset => startDate.AddMonths(offset))
                .Select(date => new
                {
                    Year = date.Year,
                    Month = date.Month,
                    Label = date.ToString("MMM yyyy") // Jan 2023 format
                })
                .ToList();

            // Query sales grouped by month
            var salesByMonth = await _context.Invoice
                .Where(i => i.User_ID == userId && 
                            i.Invoice_Date >= startDate && 
                            i.Invoice_Date < endDate)
                .GroupBy(i => new { i.Invoice_Date.Year, i.Invoice_Date.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Total = g.Sum(i => i.Total_Amount)
                })
                .ToDictionaryAsync(x => new { x.Year, x.Month }, x => x.Total);

            // Combine month labels with sales data
            var data = monthLabels.Select(m => new ChartData
            {
                Label = m.Label,
                Total = salesByMonth.ContainsKey(new { m.Year, m.Month }) ? 
                        salesByMonth[new { m.Year, m.Month }] : 0,
                Date = $"{m.Year}-{m.Month:00}" // Add full date for sorting
            }).ToList();

            return Ok(data.OrderBy(d => d.Date).ToList());
        }
    }

    public class ChartData
    {
        public string Label { get; set; }
        public decimal Total { get; set; }
        public string Date { get; set; }
    }
    
    public class YearlyComparisonData
    {
        public int Year { get; set; }
        public decimal Total { get; set; }
        public List<MonthlyData> MonthlyData { get; set; }
    }
    
    public class MonthlyData
    {
        public int Month { get; set; }
        public string MonthName { get; set; }
        public decimal Total { get; set; }
    }
}