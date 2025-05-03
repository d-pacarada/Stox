using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data; 
using Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StoxAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly AppDbContext _context; 

        public ContactsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/contacts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts()
        {
            var contacts = await _context.Contact.ToListAsync();
            return Ok(contacts);
        }

        // POST: api/contacts
        [HttpPost]
        public async Task<ActionResult<Contact>> PostContact(Contact contact)
        {
            contact.Date = DateTime.Now;

            _context.Contact.Add(contact);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContacts), new { id = contact.Contact_ID }, contact);
        }

        // DELETE: api/contacts/5
         [HttpDelete("{id}")]
public async Task<IActionResult> DeleteContact(int id)
{
    var contact = await _context.Contact.FindAsync(id);
    if (contact == null)
        return NotFound();

    _context.Contact.Remove(contact);
    await _context.SaveChangesAsync();

    return NoContent();
}

    }

}



