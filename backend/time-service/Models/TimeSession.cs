using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace time_service.Models
{
    [Table("time_sessions")]
    public class TimeSession
    {
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("user_id")]
        public long UserId { get; set; }

        [Required]
        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime? EndTime { get; set; }

        [Column("elapsed_time")]
        public TimeSpan? ElapsedTime { get; set; }

        [Column("full_elapsed_time")]
        public TimeSpan? FullElapsedTime { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("iteration")]
        public DateTime? Iteration { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}