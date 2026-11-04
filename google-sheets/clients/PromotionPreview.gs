// Included in the combined update. Public promotion claims stay paused while the wheel is covered.
function sbPortalPromotionPreviewEvent(event){
 let data;try{data=JSON.parse(event?.postData?.contents||'null');}catch{return null;}
 if(!data||!['rewardsSettings','rewardClaim','rewardReferral'].includes(data.action))return null;
 const value=data.action==='rewardsSettings'?{ok:true,enabled:false,preview:true}:{ok:false,error:'Promotions are coming soon. The wheel is not open yet.'};
 return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
