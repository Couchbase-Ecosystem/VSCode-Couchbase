export const parseErrorMessages = (error: any) => {
    const parsedError = JSON.parse(error);
    if(!parsedError.code) {
        return error;
    }
    switch(parsedError.code){
        case "context_length_exceeded":
            return "The total length of chat has exceeded the limit";
        default:
            return parsedError.message || parsedError || error;
    }
};