using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace time_service.Models
{
    [Table("users")]
    public class User
    {
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        [StringLength(191)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        [StringLength(191)]
        public string Email { get; set; } = string.Empty;

        [Column("email_verified_at")]
        public DateTime? EmailVerifiedAt { get; set; }

        [Column("remember_token")]
        [StringLength(100)]
        public string? RememberToken { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<TimeSession> TimeSessions { get; set; } = new List<TimeSession>();
    }
}