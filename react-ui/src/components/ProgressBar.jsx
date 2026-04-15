function ProgressBar({ progressPercent }) {
  return (
    <section className="panel panel--progress">
      <p className="progress-label">Progress to next rank: {progressPercent}%</p>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
}

export default ProgressBar;