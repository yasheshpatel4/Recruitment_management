using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class UserApprovalRequest
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public string Action { get; set; } = string.Empty; // "approve" or "reject"
    }
}
