export const parseErrorMessages = (error: any) => {
    if(!error.code) {
        return error;
    }
    switch(error.code){
        case "context_length_exceeded":
            return "The total length of chat has exceeded the limit";
        default:
            return error.message || error;
    }
};