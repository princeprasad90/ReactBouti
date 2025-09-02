export const ValidationForDecimal = (decimalDigits)=>{   
    if (decimalDigits!=undefined){
        let StrDigits = decimalDigits.toString().split('.')[1];
        if (StrDigits!=undefined){
            let decimalPlaces = StrDigits.length;
            return decimalPlaces;
        }
        else{
            return 0;
        }        
    }
    else {
        return 0;
    }
}