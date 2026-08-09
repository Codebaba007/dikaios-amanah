async function testAdminLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dikaios.edu', password: 'adminpassword123' })
    });
    const data = await res.json();
    console.log('Login Response:');
    console.log(JSON.stringify(data, null, 2));

    if (res.ok && data.user && data.user.role === 'ADMINISTRATOR') {
      console.log('SUCCESS: Admin account authenticated and received correct role.');
    } else {
      console.log('FAILED: Role or authentication incorrect.');
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testAdminLogin();
