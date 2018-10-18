
let protocol = null;

export default function findProtocol() {
  if ( protocol === null) {
    protocol = _determineProtocol();
  }
  return protocol;
}


/** checks for http or https */
let _determineProtocol = function() {
  var protocol = 'http:';
  if (document && "https:" == document.location.protocol) {
    protocol = 'https:'
  }
  return protocol;
}
