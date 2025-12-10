using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class UpdateInterviewStatusDto
    {
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty; // Scheduled, Other Interview, Selected, Rejected, Cancelled
    }
}
