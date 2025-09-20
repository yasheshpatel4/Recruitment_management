namespace RecruitmentSystem.Api.Models
{
    public class CandidateJob
    {
        public int Id { get; set; }
        public int CandidateId { get; set; }
        public int JobId { get; set; }
        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Candidate? Candidate { get; set; }
        public Job? Job { get; set; }
    }
}
