// Admin Dashboard Diagnostics Test
async function runDiagnostics() {
  console.log('🔍 Running Admin Dashboard Diagnostics');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('http://localhost:3004/api/admin/diagnostics');
    
    if (response.ok) {
      const diagnostics = await response.json();
      
      console.log('\n📊 DIAGNOSTIC RESULTS:');
      console.log('Timestamp:', diagnostics.timestamp);
      
      console.log('\n🔧 Environment:');
      Object.entries(diagnostics.environment).forEach(([key, value]) => {
        const status = value === 'configured' ? '✅' : '❌';
        console.log(`   ${status} ${key}: ${value}`);
      });
      
      console.log('\n🧪 Tests:');
      Object.entries(diagnostics.tests).forEach(([testName, result]) => {
        const status = result.status === 'success' ? '✅' : 
                     result.status === 'authenticated' ? '✅' : 
                     result.status === 'not_authenticated' ? '⚠️' : '❌';
        console.log(`   ${status} ${testName}: ${result.status}`);
        if (result.message) {
          console.log(`      Message: ${result.message}`);
        }
        if (result.error) {
          console.log(`      Error: ${result.error}`);
        }
      });
      
      // Analyze results
      console.log('\n📋 ANALYSIS:');
      const hasErrors = Object.values(diagnostics.tests).some(test => test.status === 'error');
      const isAuthenticated = diagnostics.tests.authSession?.status === 'authenticated';
      
      if (hasErrors) {
        console.log('   ❌ Critical issues found - see errors above');
      } else if (!isAuthenticated) {
        console.log('   ⚠️  Not authenticated - this is expected for unauthenticated requests');
      } else {
        console.log('   ✅ All systems operational');
      }
      
    } else {
      console.log(`❌ Diagnostics API failed: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Diagnostics test failed:', error.message);
  }
  
  console.log('\n🏁 Diagnostics completed');
}

runDiagnostics();