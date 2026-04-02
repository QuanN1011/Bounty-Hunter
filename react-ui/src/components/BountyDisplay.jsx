function BountyDisplay({currentBounty, totalBounty, level}){
    return (
    <section>
      <h2>Captain's Log</h2>
      <p>Live bounty: {currentBounty}</p>
      <p>Total earned: {totalBounty}</p>
      <p>Rank: {level}</p>
    </section>
    )
}

export default BountyDisplay;