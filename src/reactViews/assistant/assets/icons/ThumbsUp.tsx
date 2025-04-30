const ThumbsUpIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="#000"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        stroke="#325a9a"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M3 10a1 1 0 011-1h3v12H4a1 1 0 01-1-1V10zM7 11v8l1.992 1.328a4 4 0 002.22.672h5.247a3 3 0 002.959-2.507l1.194-7.164A2 2 0 0018.639 9H14"></path>
        <path d="M14 9l.687-3.436a1.807 1.807 0 00-1.2-2.068v0a1.807 1.807 0 00-2.188.906L8 11H7"></path>
      </g>
    </svg>
  );
};

export default ThumbsUpIcon;
