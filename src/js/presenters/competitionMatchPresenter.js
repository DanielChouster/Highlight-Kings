import React, { useState, useEffect } from 'react';
import MatchSource from '../apiSource/matchSource';
import CompetitionMatches from '../competitionMatchView'
import { Navigate } from 'react-router-dom'

function CompetitionMatchPresenter(props){
  const [comp, setComp] = useState(null);
  const [error, setError] = useState(undefined);
  
  useEffect(()=>{
    let isMounted = true;
    async function getComps(){
      try {
        let data = await MatchSource.getAllCompetitions();
        if(isMounted)
        setComp(data);
      } catch (e) {
        setError(e)
      }
    }
    getComps()
    return()=>{isMounted = false;}
  }, [])
  
  if (error) {
    return <Navigate to="/error" />
  }
  
  return comp && (
    <CompetitionMatches comps={comp} chosenComp={comp => props.model.selectCompetition(comp)} />
  )
}

export default CompetitionMatchPresenter;