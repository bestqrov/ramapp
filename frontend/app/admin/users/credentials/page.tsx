'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Key, Users, UserPlus, Edit3, Eye, EyeOff } from 'lucide-react';

interface StudentAccount {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    student: {
        id: string;
        name: string;
        surname: string;
        phone: string;
    };
}

interface ParentAccount {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    student: {
        id: string;
        name: string;
        surname: string;
        phone: string;
    };
}

interface TeacherAccount {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    groups: Array<{
        id: string;
        name: string;
        subject: string;
    }>;
}

interface UserAccounts {
    students: StudentAccount[];
    parents: ParentAccount[];
    teachers: TeacherAccount[];
}

export default function UserCredentialsPage() {
    const { accessToken } = useAuthStore();
    const [accounts, setAccounts] = useState<UserAccounts | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'teachers'>('students');
    
    // Student creation
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    
    // Parent creation
    const [showParentForm, setShowParentForm] = useState(false);
    const [selectedParentStudentId, setSelectedParentStudentId] = useState('');
    
    // Teacher creation/edit
    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<TeacherAccount | null>(null);
    const [teacherForm, setTeacherForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        groupIds: [] as string[]
    });
    
    const [availableGroups, setAvailableGroups] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUserAccounts();
        fetchAvailableStudents();
        fetchAvailableGroups();
    }, []);

    const fetchUserAccounts = async () => {
        try {
            const response = await fetch('/api/users/accounts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAccounts(data.data);
            }
        } catch (error) {
            console.error('Error fetching user accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const response = await fetch('/api/students', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableStudents(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchAvailableGroups = async () => {
        try {
            const response = await fetch('/api/groups', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableGroups(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const createStudentCredentials = async () => {
        try {
            const response = await fetch('/api/users/credentials/student', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId: selectedStudentId }),
            });

            if (response.ok) {
                const result = await response.json();
                setShowStudentForm(false);
                setSelectedStudentId('');
                fetchUserAccounts();
                alert(`Identifiants créés! Email: ${result.data.credentials.email}, Mot de passe: ${result.data.credentials.password}`);
            }
        } catch (error) {
            console.error('Error creating student credentials:', error);
            alert('Erreur lors de la création des identifiants étudiant');
        }
    };

    const createParentCredentials = async () => {
        try {
            const response = await fetch('/api/users/credentials/parent', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId: selectedParentStudentId }),
            });

            if (response.ok) {
                const result = await response.json();
                setShowParentForm(false);
                setSelectedParentStudentId('');
                fetchUserAccounts();
                alert(`Identifiants parent créés! Email: ${result.data.credentials.email}, Mot de passe: ${result.data.credentials.password}`);
            }
        } catch (error) {
            console.error('Error creating parent credentials:', error);
            alert('Erreur lors de la création des identifiants parent');
        }
    };

    const createOrUpdateTeacherCredentials = async () => {
        try {
            const url = editingTeacher 
                ? `/api/users/credentials/teacher/${editingTeacher.id}`
                : '/api/users/credentials/teacher';
            
            const method = editingTeacher ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teacherForm),
            });

            if (response.ok) {
                const result = await response.json();
                setShowTeacherForm(false);
                setEditingTeacher(null);
                setTeacherForm({ name: '', email: '', phone: '', password: '', groupIds: [] });
                fetchUserAccounts();
                
                if (!editingTeacher) {
                    alert(`Identifiants enseignant créés! Email: ${result.data.credentials.email}, Mot de passe: ${result.data.credentials.password}`);
                } else {
                    alert('Identifiants enseignant mis à jour avec succès!');
                }
            }
        } catch (error) {
            console.error('Error saving teacher credentials:', error);
            alert('Erreur lors de la sauvegarde des identifiants enseignant');
        }
    };

    const openTeacherEdit = (teacher: TeacherAccount) => {
        setEditingTeacher(teacher);
        setTeacherForm({
            name: teacher.name,
            email: teacher.email,
            phone: '',
            password: '',
            groupIds: teacher.groups.map(g => g.id)
        });
        setShowTeacherForm(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const studentColumns = [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'student', label: 'Étudiant', render: (account: StudentAccount) => `${account.student?.name} ${account.student?.surname}` },
        { key: 'createdAt', label: 'Créé le', render: (account: StudentAccount) => new Date(account.createdAt).toLocaleDateString('fr-FR') }
    ];

    const parentColumns = [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'student', label: 'Enfant', render: (account: ParentAccount) => `${account.student?.name} ${account.student?.surname}` },
        { key: 'createdAt', label: 'Créé le', render: (account: ParentAccount) => new Date(account.createdAt).toLocaleDateString('fr-FR') }
    ];

    const teacherColumns = [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'groups', label: 'Groupes', render: (account: TeacherAccount) => account.groups?.map(g => g.name).join(', ') || '' },
        { 
            key: 'actions', 
            label: 'Actions', 
            render: (account: TeacherAccount) => (
                <Button
                    onClick={() => openTeacherEdit(account)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                >
                    <Edit3 className="w-4 h-4" />
                    Modifier
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Key className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestion des Identifiants</h1>
                            <p className="text-gray-600">Créez et gérez les identifiants pour les étudiants, parents et enseignants</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { key: 'students', label: 'Étudiants', count: accounts?.students?.length || 0 },
                            { key: 'parents', label: 'Parents', count: accounts?.parents?.length || 0 },
                            { key: 'teachers', label: 'Enseignants', count: accounts?.teachers?.length || 0 }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Action Buttons */}
                    <div className="mb-6">
                        {activeTab === 'students' && (
                            <Button
                                onClick={() => setShowStudentForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Créer Identifiants Étudiant
                            </Button>
                        )}
                        
                        {activeTab === 'parents' && (
                            <Button
                                onClick={() => setShowParentForm(true)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Créer Identifiants Parent
                            </Button>
                        )}
                        
                        {activeTab === 'teachers' && (
                            <Button
                                onClick={() => {
                                    setEditingTeacher(null);
                                    setTeacherForm({ name: '', email: '', phone: '', password: '', groupIds: [] });
                                    setShowTeacherForm(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Créer Identifiants Enseignant
                            </Button>
                        )}
                    </div>

                    {/* Tables */}
                    {activeTab === 'students' && accounts?.students && (
                        <Table
                            data={accounts.students}
                            columns={studentColumns}
                            emptyMessage="Aucun compte étudiant créé"
                        />
                    )}
                    
                    {activeTab === 'parents' && accounts?.parents && (
                        <Table
                            data={accounts.parents}
                            columns={parentColumns}
                            emptyMessage="Aucun compte parent créé"
                        />
                    )}
                    
                    {activeTab === 'teachers' && accounts?.teachers && (
                        <Table
                            data={accounts.teachers}
                            columns={teacherColumns}
                            emptyMessage="Aucun compte enseignant créé"
                        />
                    )}
                </div>
            </div>

            {/* Student Form Modal */}
            {showStudentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer Identifiants Étudiant</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sélectionner un étudiant SOUTIEN
                            </label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choisir un étudiant...</option>
                                {availableStudents.map((student: any) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} {student.surname} - {student.schoolLevel}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowStudentForm(false);
                                    setSelectedStudentId('');
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={createStudentCredentials}
                                disabled={!selectedStudentId}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Créer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Parent Form Modal */}
            {showParentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer Identifiants Parent</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sélectionner un étudiant SOUTIEN
                            </label>
                            <select
                                value={selectedParentStudentId}
                                onChange={(e) => setSelectedParentStudentId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choisir un étudiant...</option>
                                {availableStudents.map((student: any) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} {student.surname} - Parent: {student.parentName || 'Non spécifié'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowParentForm(false);
                                    setSelectedParentStudentId('');
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={createParentCredentials}
                                disabled={!selectedParentStudentId}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Créer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Teacher Form Modal */}
            {showTeacherForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingTeacher ? 'Modifier' : 'Créer'} Identifiants Enseignant
                        </h3>
                        
                        <div className="space-y-4">
                            <Input
                                label="Nom complet"
                                value={teacherForm.name}
                                onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                placeholder="Nom de l'enseignant"
                            />
                            
                            <Input
                                label="Email"
                                type="email"
                                value={teacherForm.email}
                                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                            
                            <Input
                                label="Téléphone"
                                value={teacherForm.phone}
                                onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                                placeholder="Numéro de téléphone"
                            />
                            
                            <div className="relative">
                                <Input
                                    label="Mot de passe"
                                    type={showPassword ? 'text' : 'password'}
                                    value={teacherForm.password}
                                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                    placeholder={editingTeacher ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Groupes assignés
                                </label>
                                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {availableGroups.map((group: any) => (
                                        <label key={group.id} className="flex items-center space-x-2 mb-1">
                                            <input
                                                type="checkbox"
                                                checked={teacherForm.groupIds.includes(group.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setTeacherForm({
                                                            ...teacherForm,
                                                            groupIds: [...teacherForm.groupIds, group.id]
                                                        });
                                                    } else {
                                                        setTeacherForm({
                                                            ...teacherForm,
                                                            groupIds: teacherForm.groupIds.filter(id => id !== group.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {group.name} - {group.subject}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowTeacherForm(false);
                                    setEditingTeacher(null);
                                    setTeacherForm({ name: '', email: '', phone: '', password: '', groupIds: [] });
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={createOrUpdateTeacherCredentials}
                                disabled={!teacherForm.name || (!editingTeacher && !teacherForm.password)}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {editingTeacher ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}