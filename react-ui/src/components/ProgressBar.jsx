function ProgressBar({ progressPercent }) {
  return (
    <section>
      <p>Progress to next rank: {progressPercent}%</p>
      <div style={{ background: "#ddd", height: "12px", borderRadius: "6px" }}>
        <div
          style={{
            width: `${progressPercent}%`,
            background: "#4caf50",
            height: "100%",
            borderRadius: "6px",
          }}
        />
      </div>
    </section>
  );
}

export default ProgressBar;