import '../css/matches.css';
import PlaceholderImage from '../images/image-not-found.png';

const setLive = <span id = "live">LIVE</span>;
const noResult = <div className="matches">No matches could be found for that particular team</div>

export function MatchesSearch(props) {
  const title = props.compTitle.competition;
  const date = props.compTitle.matches[0].season;
  const options = ["All", "Live", "Scheduled", "Finished"];

  return (
    <div className="matches">
      <h1>{title.name === "Primera Division" ? "La Liga" : title.name}</h1>
      <div id="tDates">
        Start: {date.startDate} &nbsp;&nbsp; End: {date.endDate}
      </div>
      <span>
        <input type ="text" size = "55" onInput={e => props.onText(e.target.value) }placeholder = {props.placeholder || 'Enter team name'}/>
        <select onChange={e => props.onType(e.target.value) }>
          {options.map(x => <option key = {x.toString()} value ={x.toUpperCase()}>{x}</option>)}
        </select>
        <button className = "mButton" onClick={() => props.onSearch()}>Find matches</button>
      </span>
    </div>
  );
}

export function MatchesSchedule(props) {
  if (!props.match.matches.length)
    return noResult;

  return (
    <div className="matches">
    <table>
      <tbody>
      <tr>
        <th>Date</th>
        <th>Playing teams</th>
        <th>Status</th>
        <th>Score</th>
      </tr>
      {
        props.match.matches.map(function(x) {
          return [
            <tr key ={x.id}>
              <td width={150}>{x.utcDate.substring(0,10)}</td>
              <td id ="teamsTable">
                <span id="leftTeam">
                {props.teams.teams.filter(y => y.id === x.homeTeam.id).map(y => <img src={y.crestUrl  ?? PlaceholderImage} alt="team logo" height ="50" key={y.id}/>)}
                {x.homeTeam.name}
                </span> 
                <span id="rightTeam">
                {x.awayTeam.name} 
                {props.teams.teams.filter(y => y.id === x.awayTeam.id).map(y => <img  src={y.crestUrl  ?? PlaceholderImage} alt="team logo" height ="50" key={y.id}/>)}
                </span>
              </td>
              <td width={125}>{x.status === "IN_PLAY" ? setLive : x.status}</td>
              <td id ="tScore">{x.score.fullTime.homeTeam}&nbsp;:&nbsp;{x.score.fullTime.awayTeam} </td>
            </tr>
          ];})
        }
        </tbody>
    </table>
    </div>
  );
}

