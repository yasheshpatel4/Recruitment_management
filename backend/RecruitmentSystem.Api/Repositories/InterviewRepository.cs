using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace RecruitmentSystem.Api.Repositories
{
    public class InterviewRepository : IInterviewRepository
    {
        private readonly AppDbContext _context;

        public InterviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Interview?> GetByIdAsync(int id)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(iv => iv.User)
                .Include(i => i.Feedbacks)
                .ThenInclude(f => f.Interviewer)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<List<Interview>> GetByCandidateIdAsync(int candidateId)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(iv => iv.User)
                .Include(i => i.Feedbacks)
                .ThenInclude(f => f.Interviewer)
                .Where(i => i.CandidateId == candidateId)
                .OrderByDescending(i => i.ScheduledDate)
                .ToListAsync();
        }

        public async Task<List<Interview>> GetAllAsync()
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(iv => iv.User)
                .Include(i => i.Feedbacks)
                .ThenInclude(f => f.Interviewer)
                .OrderByDescending(i => i.ScheduledDate)
                .ToListAsync();
        }

        public async Task<Interview> CreateAsync(Interview interview)
        {
            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();
            return interview;
        }

        public async Task<Interview?> UpdateAsync(Interview interview)
        {
            _context.Interviews.Update(interview);
            await _context.SaveChangesAsync();
            return interview;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var interview = await _context.Interviews.FindAsync(id);
            if (interview == null)
                return false;

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Interview>> GetInterviewsByJobIdAsync(int jobId)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(iv => iv.User)
                .Include(i => i.Feedbacks)
                .ThenInclude(f => f.Interviewer)
                .Where(i => i.JobId == jobId)
                .OrderByDescending(i => i.ScheduledDate)
                .ToListAsync();
        }

        public async Task<List<Interview>> GetInterviewsByInterviewerIdAsync(int interviewerId)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(iv => iv.User)
                .Include(i => i.Feedbacks)
                .ThenInclude(f => f.Interviewer)
                .Where(i => i.Interviewers.Any(iv => iv.UserId == interviewerId))
                .OrderByDescending(i => i.ScheduledDate)
                .ToListAsync();
        }

        public async Task<bool> UpdateInterviewStatusAsync(int interviewId, string status)
        {
            var interview = await _context.Interviews.FindAsync(interviewId);
            if (interview == null)
                return false;

            interview.Status = status;
            if (status == "Selected" || status == "Rejected")
            {
                interview.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Feedback> AddFeedbackAsync(Feedback feedback)
        {
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<List<Feedback>> GetFeedbacksByInterviewIdAsync(int interviewId)
        {
            return await _context.Feedbacks
                .Include(f => f.Interviewer)
                .Where(f => f.InterviewId == interviewId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }
    }
}
