using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class InterviewFeedbackDto
    {
        [Required]
        public int InterviewerId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string Comments { get; set; } = string.Empty;
    }
}
