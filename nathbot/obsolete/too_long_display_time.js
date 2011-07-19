// Too long display time 2 : la revanche !
// D�velopp� par myrkash <at> hotmail.com pour la ..::KnightSubTeaM::.. et les -=(Lords of Kobol)=-

VSSPlugin = {
  Name : 'Too long display time',
  Description : 'Mon petit outil pour d�tecter les timecodes '+
  	'trop longs ! Ya juste � entrer la dur�e maximale, '+
        'et voil� le tour est jou� ! D�velopp� par Myrkash, '+
        'pour la ..::KnightSubTeaM::.., et les -=(Lords of Kobol)=-.'+
        'Cette fonction est garanti Bio, sans pesticide nuisant'+
        ' � la qualit� du sous-titre',

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
