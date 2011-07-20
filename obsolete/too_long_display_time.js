// Too long display time 2 : la revanche !
// Développé par myrkash <at> hotmail.com pour la ..::KnightSubTeaM::.. et les -=(Lords of Kobol)=-

VSSPlugin = {
  Name : 'Too long display time',
  Description : 'Mon petit outil pour détecter les timecodes '+
  	'trop longs ! Ya juste à entrer la durée maximale, '+
        'et voilà le tour est joué ! Développé par Myrkash, '+
        'pour la ..::KnightSubTeaM::.., et les -=(Lords of Kobol)=-.'+
        'Cette fonction est garanti Bio, sans pesticide nuisant'+
        ' à la qualité du sous-titre',

  Color : 0xFF6600,
  Message : 'Subtitle display time is too long :',
  ParamMaxTime : { Value : 5000, Unit : 'ms' },
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    if (Duration > this.ParamMaxTime.Value) {
    	return (Math.round(Duration) + ' ' + this.ParamMaxTime.Unit);
    } else {
    	return '';
    }
  }
}
