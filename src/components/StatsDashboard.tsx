import React, { useMemo } from 'react';
import { Trade } from '../types';
import { calculatePnL, formatCurrency, cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, isSameDay, startOfMonth, isSameMonth } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, Calendar, BarChart3 } from 'lucide-react';

interface StatsDashboardProps {
  trades: Trade[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ trades }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const thisMonth = startOfMonth(now);

    let totalPnL = 0;
    let dailyPnL = 0;
    let monthlyPnL = 0;
    let winCount = 0;
    let totalFees = 0;

    trades.forEach(trade => {
      const pnl = calculatePnL(trade);
      const tradeDate = new Date(trade.trade_date);
      
      totalPnL += pnl;
      totalFees += trade.fees;
      if (pnl > 0) winCount++;

      if (isSameDay(tradeDate, today)) {
        dailyPnL += pnl;
      }
      if (isSameMonth(tradeDate, thisMonth)) {
        monthlyPnL += pnl;
      }
    });

    const winRate = trades.length > 0 ? (winCount / trades.length) : 0;

    return { totalPnL, dailyPnL, monthlyPnL, winRate, totalFees, tradeCount: trades.length };
  }, [trades]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        label="Daily PnL" 
        value={stats.dailyPnL} 
        icon={<Calendar size={20} />}
        isCurrency
      />
      <StatCard 
        label="Monthly PnL" 
        value={stats.monthlyPnL} 
        icon={<BarChart3 size={20} />}
        isCurrency
      />
      <StatCard 
        label="Total Equity PnL" 
        value={stats.totalPnL} 
        icon={<Wallet size={20} />}
        isCurrency
      />
      <StatCard 
        label="Win Rate" 
        value={stats.winRate * 100} 
        icon={<TrendingUp size={20} />}
        suffix="%"
      />
    </div>
  );
};

export const EquityCurve: React.FC<StatsDashboardProps> = ({ trades }) => {
  const chartData = useMemo(() => {
    // Group trades by date
    const tradesByDay: Record<string, number> = {};
    
    trades.forEach(trade => {
      const day = format(new Date(trade.trade_date), 'yyyy-MM-dd');
      const pnl = calculatePnL(trade);
      tradesByDay[day] = (tradesByDay[day] || 0) + pnl;
    });

    // Sort days
    const sortedDays = Object.keys(tradesByDay).sort();

    let cumulative = 0;
    return sortedDays.map(day => {
      cumulative += tradesByDay[day];
      return {
        date: format(new Date(day), 'MM/dd'),
        pnl: cumulative,
        rawDate: day
      };
    });
  }, [trades]);

  return (
    <div className="card-brutal p-6 h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif italic text-lg">Equity Curve</h3>
        <div className="text-[11px] uppercase font-bold tracking-wider opacity-40">
          Cumulative Performance
        </div>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontFamily: 'monospace', opacity: 0.5 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontFamily: 'monospace', opacity: 0.5 }}
              tickFormatter={(val) => `$${val.toFixed(2)}`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'PnL']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #141414',
                borderRadius: '0px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="pnl" 
              stroke="#141414" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPnL)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


const StatCard = ({ label, value, icon, isCurrency, suffix = "" }: any) => {
  const isPositive = value >= 0;
  
  return (
    <div className="card-brutal p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase font-bold tracking-wider opacity-40">{label}</span>
        <div className="opacity-20">{icon}</div>
      </div>
      <div className={cn(
        "text-2xl font-mono tracking-tighter font-bold",
        isCurrency && (isPositive ? "text-emerald-600" : "text-rose-600")
      )}>
        {isCurrency ? formatCurrency(value) : `${value.toFixed(2)}${suffix}`}
      </div>
    </div>
  );
};
