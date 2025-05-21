using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IncomeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IncomeController(AppDbContext context)
        {
            _context = context;
        }

        // Grouped income: daily/weekly/monthly/yearly or by date range
        [HttpGet]
        public IActionResult GetIncome(
            [FromQuery] string filter = "daily",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "userId").Value);
            var query = _context.Invoices.Where(i => i.User_ID == userId);
            var today = DateTime.Today;
            
            if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(i =>
                    i.Invoice_Date.Date >= startDate.Value.Date &&
                    i.Invoice_Date.Date <= endDate.Value.Date);
                
                // For custom date ranges, we'll use daily grouping by default
                var result = query
                    .GroupBy(i => i.Invoice_Date.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Amount = g.Sum(i => i.Total_Amount),
                        DisplayLabel = g.Key.ToString("MMM dd, yyyy")
                    })
                    .OrderByDescending(x => x.Date)
                    .ToList();
                
                return Ok(result);
            }
            
            // Handle different filters with appropriate grouping
            switch (filter)
            {
                case "daily":
                    // Get the last 30 days
                    var thirtyDaysAgo = today.AddDays(-30);
                    query = query.Where(i => i.Invoice_Date.Date >= thirtyDaysAgo);
                    
                    var dailyResult = query
                        .GroupBy(i => i.Invoice_Date.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            Amount = g.Sum(i => i.Total_Amount),
                            DisplayLabel = g.Key.ToString("MMM dd, yyyy")
                        })
                        .OrderByDescending(x => x.Date)
                        .ToList();
                    
                    return Ok(dailyResult);
                
                case "weekly":
                    // Get results for the last 52 weeks (1 year)
                    var yearAgo = today.AddYears(-1);
                    query = query.Where(i => i.Invoice_Date.Date >= yearAgo);
                    
                    var weeklyResults = query
                        .AsEnumerable() // Process in memory after fetching from DB
                        .GroupBy(i => {
                            // Get ISO week number (1-53)
                            var cal = CultureInfo.CurrentCulture.Calendar;
                            var week = cal.GetWeekOfYear(i.Invoice_Date, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
                            var year = i.Invoice_Date.Year;
                            return new { Year = year, Week = week };
                        })
                        .Select(g => new
                        {
                            Date = GetFirstDayOfWeek(g.Key.Year, g.Key.Week), // Use first day of week for sorting
                            Amount = g.Sum(i => i.Total_Amount),
                            DisplayLabel = $"Week {g.Key.Week}, {g.Key.Year}"
                        })
                        .OrderByDescending(x => x.Date)
                        .ToList();
                    
                    return Ok(weeklyResults);
                
                case "monthly":
                    // Get monthly results for the last 24 months (2 years)
                    var twoYearsAgo = today.AddYears(-2);
                    query = query.Where(i => i.Invoice_Date.Date >= twoYearsAgo);
                    
                    var monthlyResults = query
                        .AsEnumerable() // Process in memory after fetching from DB
                        .GroupBy(i => new { Year = i.Invoice_Date.Year, Month = i.Invoice_Date.Month })
                        .Select(g => new
                        {
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1), // First day of month for sorting
                            Amount = g.Sum(i => i.Total_Amount),
                            DisplayLabel = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy")
                        })
                        .OrderByDescending(x => x.Date)
                        .ToList();
                    
                    return Ok(monthlyResults);
                
                case "yearly":
                    // Get yearly results for all available data
                    var yearlyResults = query
                        .AsEnumerable() // Process in memory after fetching from DB
                        .GroupBy(i => i.Invoice_Date.Year)
                        .Select(g => new
                        {
                            Date = new DateTime(g.Key, 1, 1), // First day of year for sorting
                            Amount = g.Sum(i => i.Total_Amount),
                            DisplayLabel = g.Key.ToString()
                        })
                        .OrderByDescending(x => x.Date)
                        .ToList();
                    
                    return Ok(yearlyResults);
                
                default:
                    // Default to daily view of last 30 days
                    var defaultDaysAgo = today.AddDays(-30);
                    query = query.Where(i => i.Invoice_Date.Date >= defaultDaysAgo);
                    
                    var defaultResult = query
                        .GroupBy(i => i.Invoice_Date.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            Amount = g.Sum(i => i.Total_Amount),
                            DisplayLabel = g.Key.ToString("MMM dd, yyyy")
                        })
                        .OrderByDescending(x => x.Date)
                        .ToList();
                    
                    return Ok(defaultResult);
            }
        }

        // Helper method to get the first day of a week
        private DateTime GetFirstDayOfWeek(int year, int weekOfYear)
        {
            // Get January 1st of the year
            var jan1 = new DateTime(year, 1, 1);
            
            // Get the day of the week for January 1st
            var daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
            
            // Get the first Monday of the year
            var firstMonday = daysOffset > 0 ? jan1.AddDays(daysOffset) : jan1.AddDays(daysOffset + 7);
            
            // Add the weeks
            var result = firstMonday.AddDays((weekOfYear - 1) * 7);
            return result;
        }

        // Raw income: return every invoice individually (no grouping)
        [HttpGet("raw")]
        public IActionResult GetRawIncome(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "userId").Value);
            var query = _context.Invoices.Where(i => i.User_ID == userId);

            if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(i =>
                    i.Invoice_Date.Date >= startDate.Value.Date &&
                    i.Invoice_Date.Date <= endDate.Value.Date);
            }

            var result = query
                .OrderByDescending(i => i.Invoice_Date)
                .Select(i => new
                {
                    Date = i.Invoice_Date,
                    Amount = i.Total_Amount
                })
                .ToList();

            return Ok(result);
        }

        // Get comparison with previous period
        [HttpGet("comparison")]
        public IActionResult GetComparison([FromQuery] string filter = "daily")
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "userId").Value);
            var query = _context.Invoices.Where(i => i.User_ID == userId);
            var today = DateTime.Today;
            
            switch (filter)
            {
                case "daily":
                    var yesterday = today.AddDays(-1);
                    var todayAmount = query.Where(i => i.Invoice_Date.Date == today).Sum(i => i.Total_Amount);
                    var yesterdayAmount = query.Where(i => i.Invoice_Date.Date == yesterday).Sum(i => i.Total_Amount);
                    
                    return Ok(new
                    {
                        Current = todayAmount,
                        Previous = yesterdayAmount,
                        PercentChange = yesterdayAmount > 0 ? (todayAmount - yesterdayAmount) * 100 / yesterdayAmount : 0
                    });
                    
                case "weekly":
                    var currentWeekStart = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
                    var previousWeekStart = currentWeekStart.AddDays(-7);
                    
                    var currentWeekAmount = query
                        .Where(i => i.Invoice_Date.Date >= currentWeekStart && i.Invoice_Date.Date < currentWeekStart.AddDays(7))
                        .Sum(i => i.Total_Amount);
                    
                    var previousWeekAmount = query
                        .Where(i => i.Invoice_Date.Date >= previousWeekStart && i.Invoice_Date.Date < currentWeekStart)
                        .Sum(i => i.Total_Amount);
                    
                    return Ok(new
                    {
                        Current = currentWeekAmount,
                        Previous = previousWeekAmount,
                        PercentChange = previousWeekAmount > 0 ? (currentWeekAmount - previousWeekAmount) * 100 / previousWeekAmount : 0
                    });
                    
                case "monthly":
                    var currentMonthStart = new DateTime(today.Year, today.Month, 1);
                    var previousMonthStart = currentMonthStart.AddMonths(-1);
                    
                    var currentMonthAmount = query
                        .Where(i => i.Invoice_Date.Date >= currentMonthStart)
                        .Sum(i => i.Total_Amount);
                    
                    var previousMonthAmount = query
                        .Where(i => i.Invoice_Date.Date >= previousMonthStart && i.Invoice_Date.Date < currentMonthStart)
                        .Sum(i => i.Total_Amount);
                    
                    return Ok(new
                    {
                        Current = currentMonthAmount,
                        Previous = previousMonthAmount,
                        PercentChange = previousMonthAmount > 0 ? (currentMonthAmount - previousMonthAmount) * 100 / previousMonthAmount : 0
                    });
                    
                case "yearly":
                    var currentYearStart = new DateTime(today.Year, 1, 1);
                    var previousYearStart = new DateTime(today.Year - 1, 1, 1);
                    var previousYearEnd = new DateTime(today.Year - 1, 12, 31);
                    
                    var currentYearAmount = query
                        .Where(i => i.Invoice_Date.Date >= currentYearStart)
                        .Sum(i => i.Total_Amount);
                    
                    var previousYearAmount = query
                        .Where(i => i.Invoice_Date.Date >= previousYearStart && i.Invoice_Date.Date <= previousYearEnd)
                        .Sum(i => i.Total_Amount);
                    
                    return Ok(new
                    {
                        Current = currentYearAmount,
                        Previous = previousYearAmount,
                        PercentChange = previousYearAmount > 0 ? (currentYearAmount - previousYearAmount) * 100 / previousYearAmount : 0
                    });
                    
                default:
                    return BadRequest("Invalid filter type");
            }
        }
    }
}