using System.ComponentModel.DataAnnotations;

namespace RecruitmentSystem.Api.Models
{
    public class ScheduleInterviewDto
    {
        [Required]
        public int CandidateId { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required]
        [StringLength(50)]
        public string InterviewType { get; set; } = string.Empty;

        [Required]
        public int RoundNo { get; set; }

        public List<int>? InterviewerIds { get; set; }
    }
}
