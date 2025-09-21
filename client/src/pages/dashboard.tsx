import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AlertTriangle, DollarSign, FileText, Shield, Briefcase, CalendarDays, Clock, Gauge } from 'lucide-react';

const LegalContractDashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('All');
  
  // State variables for the new, more varied graphs
  const [avgSalaryByState, setAvgSalaryByState] = useState<any[]>([]);
  const [contractsByRole, setContractsByRole] = useState<any[]>([]);
  const [roleMetrics, setRoleMetrics] = useState<any[]>([]);

  // Function to calculate data for the new charts
  const getContractsByRoleData = (filteredData: any[]) => {
    const roles = filteredData.reduce((acc, contract) => {
      const role = contract.analysisResult.keyMetrics.jobRole;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
    return Object.keys(roles).map((role, index) => ({
      name: role,
      value: roles[role],
      color: colors[index % colors.length],
    }));
  };

const getRoleMetricsData = (filteredData:any[]) => {
    const roles = Array.from(new Set(filteredData.map(item => item.analysisResult.keyMetrics.jobRole)));
    const metrics = [
        { subject: 'Salary', fullMark: 20000 },
        { subject: 'Working Hours', fullMark: 60 },
        { subject: 'Annual Leave', fullMark: 30 },
        { subject: 'Probation Period', fullMark: 12 }
    ];

    const roleValues = roles.reduce((acc, role) => {
        acc[role] = { salary: 0, hours: 0, leave: 0, probation: 0, count: 0 };
        return acc;
    }, {});

    filteredData.forEach(contract => {
        const role = contract.analysisResult.keyMetrics.jobRole;
        if (!roleValues[role]) return;
        const metricsData = contract.analysisResult.keyMetrics;
        roleValues[role].salary += Number(metricsData.salary) || 0;
        roleValues[role].hours += Number(metricsData.workingHours) || 0;
        roleValues[role].leave += Number(metricsData.annualLeave) || 0;
        roleValues[role].probation += parseInt(String(metricsData.probationPeriod).replace(' months', '')) || 0;
        roleValues[role].count += 1;
    });

    const transformedData: { [key: string]: any }[] = metrics.map(metric => ({ subject: metric.subject }));

    roles.forEach(role => {
        const values = roleValues[role];
        const count = values.count || 1;

        const avgSalary = (values.salary / count);
        const avgHours = (values.hours / count);
        const avgLeave = (values.leave / count);
        const avgProbation = (values.probation / count);

        transformedData[0][role] = Math.min(100, (avgSalary / metrics[0].fullMark) * 100);
        transformedData[1][role] = Math.min(100, (avgHours / metrics[1].fullMark) * 100);
        transformedData[2][role] = Math.min(100, (avgLeave / metrics[2].fullMark) * 100);
        transformedData[3][role] = Math.min(100, (avgProbation / metrics[3].fullMark) * 100);
    });

    return { transformedData, roles };
};

  useEffect(() => {
    fetchDynamoDBData();
  }, []);

  useEffect(() => {
    const filteredData = data.filter(contract => {
      return selectedRole === 'All' || contract.analysisResult.keyMetrics.jobRole === selectedRole;
    });

    if (filteredData.length === 0) {
      setAvgSalaryByState([]);
      setContractsByRole([]);
      setRoleMetrics([]);
      return;
    }

    const states = Array.from(new Set(filteredData.map(item => item.analysisResult.state)));

    // Calculate average salary by state (Bar Chart)
    const salaryData: { [key: string]: { total: number; count: number } } = {};
    states.forEach(state => salaryData[state] = { total: 0, count: 0 });
    filteredData.forEach(item => {
      const state = item.analysisResult.state;
      salaryData[state].total += item.analysisResult.keyMetrics.salary;
      salaryData[state].count += 1;
    });
    setAvgSalaryByState(states.map(state => ({
      name: state,
      'Average Salary': (salaryData[state].total / (salaryData[state].count || 1)).toFixed(2)
    })));

    // Calculate contracts by role (Pie Chart)
    setContractsByRole(getContractsByRoleData(data));

    // Calculate metrics for radar chart
    const { transformedData } = getRoleMetricsData(filteredData);
    setRoleMetrics(transformedData);
    
  }, [data, selectedRole]);

  const fetchDynamoDBData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard-data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dynamoData = await response.json();
      setData(dynamoData);
      setError(null);
    } catch (err) {
      console.error('Error fetching DynamoDB data:', err);
      setError('Error fetching data. Please check your API connection.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getInsightCard = (title: string, value: string, icon: React.ReactNode, subtitle: string, trend: string) => (
    <Card key={title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-600">{subtitle}</p>
        {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading contract data...</div>;
  }
  
  const filteredContracts = data.filter(c => 
    selectedRole === 'All' || c.analysisResult.keyMetrics.jobRole === selectedRole
  );

  const highRiskContracts = filteredContracts.filter(c => c.risk_level === 'Red').length;
  
  const complianceData = filteredContracts.map(contract => {
    const flaggedClauses = contract.analysisResult.flaggedClauses || [];
    const highRiskClauses = flaggedClauses.filter((clause: any) => clause.riskCategory === 'High').length;
    return { complianceScore: Math.max(0, 100 - (highRiskClauses * 25)) };
  });

  const avgComplianceScore = complianceData.length > 0
    ? (complianceData.reduce((sum, item) => sum + item.complianceScore, 0) / complianceData.length).toFixed(1)
    : 0;
  
const allRoles = Array.from(new Set(data.map(item => item.analysisResult.keyMetrics.jobRole)));
const roleColors = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#8884d8'];

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">Legal Contract Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Employment contract insights for the Malaysian market</p>
          {error && <p className="text-orange-600 text-sm mt-2 font-medium bg-orange-100 p-2 rounded-md border border-orange-200">{error}</p>}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="h-5 w-5" />
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <option value="All">All Roles</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Marketing Manager">Marketing Manager</option>
            <option value="Accountant">Accountant</option>
            <option value="HR Executive">HR Executive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {getInsightCard("High Risk Contracts", `${filteredContracts.length > 0 ? ((highRiskContracts / filteredContracts.length) * 100).toFixed(1) : 0}%`, <AlertTriangle className="h-6 w-6 text-red-500" />, "Contracts with severe legal violations", `${highRiskContracts}/${filteredContracts.length} contracts`)}
        {getInsightCard("Average Compliance Score", `${avgComplianceScore}%`, <Shield className="h-6 w-6 text-blue-500" />, "Overall compliance with labour law", "Target: 90%+")}
        {getInsightCard("Total Contracts Analyzed", filteredContracts.length.toString(), <FileText className="h-6 w-6 text-green-500" />, "Total documents in the database", "")}
      </div>
      
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-700">Employment Statistics by Role & State</CardTitle>
          <p className="text-gray-500">Key metrics across different dimensions</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Graph 1: Average Salary by State (Bar Chart) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" /> Average Salary (RM) by State</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgSalaryByState} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value) => `RM ${value}`} />
                    <Legend />
                    <Bar dataKey="Average Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 2: Contracts by Job Role (Pie Chart) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Briefcase className="h-5 w-5 text-purple-600" /> Contracts by Job Role</h3>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contractsByRole}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {contractsByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
              </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 3: Key Metrics by Role (Radar Chart) */}
            <div className="space-y-4 col-span-1 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Gauge className="h-5 w-5 text-gray-600" /> Key Metrics by Role Comparison</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={roleMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
<PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {allRoles.filter(role => selectedRole === 'All' || role === selectedRole).map((role) => {
                        const roleIndex = allRoles.findIndex(r => r === role);
                        return (
                            <Radar 
                                key={role}
                                name={role}
                                dataKey={role}
                                stroke={roleColors[roleIndex % roleColors.length]}
                                fill={roleColors[roleIndex % roleColors.length]}
                                fillOpacity={0.6}
                            />
                        );
                    })}
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-700">Malaysian Labour Law Reference</CardTitle>
          <p className="text-gray-500">Quick guide to key regulations</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-xl p-6 bg-gray-100/50">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800"><Clock /> Working Hours</h3>
              <div className="space-y-1 text-sm mt-2 text-gray-600">
                <div>Maximum: <span className="font-semibold text-gray-900">45 hours/week</span></div>
                <div>Maximum: <span className="font-semibold text-gray-900">8 hours/day</span></div>
                <div className="text-xs text-gray-500 mt-2">Source: Employment Act 1955</div>
              </div>
            </div>
            <div className="border rounded-xl p-6 bg-gray-100/50">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800"><CalendarDays /> Annual Leave</h3>
              <div className="space-y-1 text-sm mt-2 text-gray-600">
                <div>&lt;2 years: <span className="font-semibold text-gray-900">8 days</span></div>
                <div>2-5 years: <span className="font-semibold text-gray-900">12 days</span></div>
                <div>&gt;5 years: <span className="font-semibold text-gray-900">16 days</span></div>
              </div>
            </div>
            <div className="border rounded-xl p-6 bg-gray-100/50">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800"><Shield /> Probation Period</h3>
              <div className="space-y-1 text-sm mt-2 text-gray-600">
                <div>Typical: <span className="font-semibold text-gray-900">3-6 months</span></div>
                <div>Legal Limit: <span className="font-semibold text-gray-900">None defined</span></div>
                <div className="text-xs text-gray-500 mt-2">Source: Industry standard</div>
            </div>
            </div>
            <div className="border rounded-xl p-6 bg-gray-100/50">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800"><DollarSign /> Minimum Wage</h3>
              <div className="space-y-1 text-sm mt-2 text-gray-600">
                <div>Peninsular: <span className="font-semibold text-gray-900">RM 1,500</span></div>
                <div>Sabah/Sarawak: <span className="font-semibold text-gray-900">RM 1,130</span></div>
                <div className="text-xs text-gray-500 mt-2">Source: As of 2022</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalContractDashboard;