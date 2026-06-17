"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MemberDetailPanel from "@/components/MemberDetailPanel";

import { MemberRole } from "@/types";

interface Member {
  _id: string;
  name: string;
  role: MemberRole;
  initials: string;
  color: string;
  joinedAt: string;
}

interface MemberStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

interface MemberWithStats extends Member {
  stats?: MemberStats;
}

const ROLES: MemberRole[] = ["Frontend", "Backend", "Design", "Events", "Publicity"];

// Sub-component for individual Member Card
const MemberCard = ({ member, onClick }: { member: MemberWithStats; onClick: (member: MemberWithStats) => void }) => {
  const handleCardClick = () => onClick(member);
  
  return (
    <div 
      onClick={handleCardClick}
      className="bg-[#111111] border border-[#222222] rounded-xl p-5 hover:border-[#333333] transition-colors cursor-pointer group flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-black font-black text-lg shrink-0"
          style={{ backgroundColor: member.color }}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate">{member.name}</h3>
          <span className="inline-block bg-[#1a1a1a] text-[#888888] text-xs px-2 py-1 rounded mt-1 font-semibold tracking-wider">
            {member.role}
          </span>
        </div>
      </div>

      {member.stats && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-[#1a1a1a] border border-[#222222] rounded-lg p-3 text-center">
            <div className="text-[#555555] text-[10px] sm:text-xs font-bold uppercase mb-1 truncate">To Do</div>
            <div className="text-white font-bold text-xl">{member.stats.todo}</div>
          </div>
          <div className="flex-1 bg-[#1a1a1a] border border-[#222222] rounded-lg p-3 text-center">
            <div className="text-[#555555] text-[10px] sm:text-xs font-bold uppercase mb-1 truncate">In Prog</div>
            <div className="text-white font-bold text-xl">{member.stats.inProgress}</div>
          </div>
          <div className="flex-1 bg-[#1a1a1a] border-[#222222] border rounded-lg p-3 text-center">
            <div className="text-[#555555] text-[10px] sm:text-xs font-bold uppercase mb-1 truncate">Done</div>
            <div className="text-[#00FF87] font-bold text-xl">{member.stats.done}</div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        {member.stats && member.stats.total > 0 ? (
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-[#888888]">PROGRESS</span>
              <span className="text-white">{Math.round((member.stats.done / member.stats.total) * 100)}%</span>
            </div>
            <div className="bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#00FF87] h-full transition-all duration-500 ease-out"
                style={{ width: `${(member.stats.done / member.stats.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[#555555] text-xs font-bold uppercase tracking-wider text-center py-2 bg-[#1a1a1a] rounded-lg">
            No tasks assigned
          </div>
        )}
      </div>
    </div>
  );
};


export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  
  const [newName, setNewName] = useState<string>("");
  const [newRole, setNewRole] = useState<MemberRole>(ROLES[0]);

  const [selectedMember, setSelectedMember] = useState<MemberWithStats | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const json = await res.json();
      const membersList: Member[] = json.data || [];

      const membersWithStats = await Promise.all(
        membersList.map(async (member: Member) => {
          try {
            const statsRes = await fetch(`/api/members/${member._id}`);
            const statsJson = await statsRes.json();
            return {
              ...member,
              stats: statsJson.data?.stats || { total: 0, todo: 0, inProgress: 0, done: 0 }
            };
          } catch {
            return {
              ...member,
              stats: { total: 0, todo: 0, inProgress: 0, done: 0 }
            };
          }
        })
      );

      setMembers(membersWithStats);
    } catch (error) {
      // Error handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;
    
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, role: newRole })
      });
      if (res.ok) {
        setIsAdding(false);
        setNewName("");
        setNewRole(ROLES[0]);
        fetchMembers();
      }
    } catch (error) {
      // Error handled gracefully
    }
  };

  const handleToggleAdd = () => setIsAdding(!isAdding);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value);
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => setNewRole(e.target.value as MemberRole);
  const handleCloseDetail = () => setSelectedMember(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-6xl font-black uppercase text-white tracking-tight">MEMBERS</h1>
            <p className="text-sm text-[#888888] uppercase tracking-widest mt-2">
              Club roster and workload overview
            </p>
          </div>
          <button 
            onClick={handleToggleAdd}
            className="bg-[#00FF87] text-black font-bold px-4 py-2 rounded-md hover:bg-[#00cc6a] transition-colors shrink-0"
          >
            {isAdding ? "Cancel" : "+ Add Member"}
          </button>
        </div>

        {isAdding && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-10">
            <h2 className="text-white font-bold mb-4 uppercase tracking-wider">New Member</h2>
            <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[#888888] text-xs font-bold uppercase mb-2">Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={handleNameChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md text-white px-4 py-2 focus:border-[#00FF87] outline-none"
                  required
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[#888888] text-xs font-bold uppercase mb-2">Role</label>
                <select 
                  value={newRole}
                  onChange={handleRoleChange}
                  className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md text-white px-4 py-2 focus:border-[#00FF87] outline-none cursor-pointer appearance-none"
                >
                  {ROLES.map((role: MemberRole) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full sm:w-auto bg-[#00FF87] text-black font-bold px-8 py-2 rounded-md hover:bg-[#00cc6a] transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-[#888888] font-bold">Loading roster...</div>
        ) : members.length === 0 ? (
          <div className="text-[#555555] font-bold italic">No members found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {members.map((member: MemberWithStats) => (
              <MemberCard 
                key={member._id} 
                member={member} 
                onClick={setSelectedMember} 
              />
            ))}
          </div>
        )}
      </main>

      {selectedMember && (
        <MemberDetailPanel
            member={selectedMember}
            stats={selectedMember.stats || { total: 0, todo: 0, inProgress: 0, done: 0 }}
            onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
