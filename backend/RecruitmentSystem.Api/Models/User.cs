using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string Roles { get; set; } = string.Empty; // JSON string of roles array
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Active"; // Active, PendingApproval, Suspended
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
    }
}
