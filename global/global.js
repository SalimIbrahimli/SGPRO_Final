function handleSubscribe(e) {
  e.preventDefault();
  const email = e.target.querySelector("input").value;
  alert(`Thank you for subscribing with: ${email}`);
  e.target.reset();
}
