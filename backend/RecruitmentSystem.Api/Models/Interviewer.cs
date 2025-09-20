namespace RecruitmentSystem.Api.Models
{
    public class Interviewer
    {
        public int Id { get; set; }
        public int InterviewId { get; set; }
        public int UserId { get; set; } // Foreign Key to Users
        
        // Navigation properties
        public Interview? Interview { get; set; }
        public User? User { get; set; }
    }
}
