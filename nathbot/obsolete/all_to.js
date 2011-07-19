// All to...
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'All to...',
  Description : 'Sets all subs to the specified level',
  Color : 0x000000,
  Message : 'All to...',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamLevel : { Value : 'FA', Unit : 'TF/FA/ABF', Description: 'TF=TOO FAST, FA=Fast acceptable, ABF=A bit fast'},

  Labels : {FA: "Fast, acceptable.", TF: "TOO FAST!", ABF: "A bit fast."},

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var rs = this.CalculateRS(CurrentSub);
    
    
    switch(this.ParamLevel.Value){
      case 'TF':
        if(rs < 35 && this.getLabel(rs) != "TOO FAST!")
          return this.Labels[this.ParamLevel.Value]+" - Current speed is: "+this.getLabel(rs);
        else
          return '';
      break;
      case 'FA':
        if(rs < 31 && this.getLabel(rs) != "TOO FAST!" && this.getLabel(rs) != "Fast, acceptable.")
          return this.Labels[this.ParamLevel.Value]+" - Current speed is: "+this.getLabel(rs);
        else
          return '';
      break;
      case 'ABF':
        if(rs < 27 && this.getLabel(rs) != "TOO FAST!" && this.getLabel(rs) != "Fast, acceptable." && this.getLabel(rs) != "A bit fast.")
          return this.Labels[this.ParamLevel.Value]+" - Current speed is: "+this.getLabel(rs);
        else
          return '';
      break;
       default:
        return '';
      break;
    }
  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var durMS = CurrentSub.Stop - CurrentSub.Start;
    var rs = this.CalculateRS(CurrentSub);
    while(this.getLabel(rs) != this.Labels[this.ParamLevel.Value] && durMS > VSSCore.MinimumDuration){
      CurrentSub.Stop --; 	
      durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
      rs = this.CalculateRS(CurrentSub);
    }
  },



	CalculateRS : function (Subtitle){
		var durMS = Subtitle.Stop - Subtitle.Start;
		var rsX = Subtitle.StrippedText.length * 1000 / (Subtitle.Stop - Subtitle.Start - 500);
		var rs = Math.round(rsX*10) / 10;
		return rs;	
	},
	
	getLabel : function (rs){
		var rsMin = 5;
		var rsMax = 35;
		var rating;
		if (rs < rsMin && rs>0)   rating = "TOO SLOW!";
		else if (rs < 10 && rs>0) rating = "Slow, acceptable.";
		else if (rs < 13 && rs>0) rating = "A bit slow.";
		else if (rs < 15 && rs>0) rating = "Good.";
		else if (rs < 23 && rs>0) rating = "Perfect.";
		else if (rs < 27 && rs>0) rating = "Good.";
		else if (rs < 31 && rs>0) rating = "A bit fast.";
		else if (rs < rsMax && rs>0) rating = "Fast, acceptable.";
		else              rating = "TOO FAST!";
		return rating;
	},
	CalculateDurLavie : function(CurrentSub){
		var ParamIdealReadingSpeed = 20;
		var durLavie = 0.5 + CurrentSub.StrippedText.length / ParamIdealReadingSpeed;
		durLavie = Math.round(durLavie*10) / 10;
		return durLavie;
	
	},
	CalculateDisplaySpeed : function(CurrentSub){
		var len = CurrentSub.StrippedText.length;
		var durMS = CurrentSub.Stop - CurrentSub.Start;     // in milliseconds
		var dsMin = 4;
		var dsMax = 22;
		var dsX = len * 1000 / durMS;       // exact
		var ds = Math.round(dsX*10) / 10;   // rounded to 1 decimal digit
		return ds;
	}

}
